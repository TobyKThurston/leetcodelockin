// Pyodide-based Python runner for the /solve page.
//
// Loads Pyodide from the jsdelivr CDN on first `init` message, then on each
// `run` message executes student code + a fixed harness inside a FRESH Python
// namespace so state never leaks between runs. The harness iterates the test
// cases, calls Solution().<method>(*args) for each, and writes a JSON array of
// { ok, val } / { ok:false, err } back into `_result_json` which the main
// thread reads out via the PyProxy.

const PYODIDE_VERSION = 'v0.29.3';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // `pyodide.js` installs `loadPyodide` as a global on `self`.
      importScripts(PYODIDE_BASE + 'pyodide.js');
      return await self.loadPyodide({ indexURL: PYODIDE_BASE });
    })();
  }
  return pyodidePromise;
}

// User code is compiled with filename "<user>" so we can walk the traceback
// and pick out the deepest frame that belongs to the student's code. That line
// number is surfaced back to the main thread as `line`, which drives both the
// "Line N — " prefix in the test panel and the Monaco gutter marker.
const HARNESS = `
import json as _j, traceback as _tb, io as _io, contextlib as _cl
_ts = _j.loads(_tests_json)

def _user_line(_exc):
    _ln = 0
    for _f in _tb.extract_tb(_exc.__traceback__):
        if _f.filename == "<user>":
            _ln = _f.lineno
    return _ln

def _fmt(_exc, _ln):
    _msg = f"{type(_exc).__name__}: {_exc}"
    return f"Line {_ln} \\u2014 {_msg}" if _ln else _msg

try:
    _user_code_obj = compile(_user_code, "<user>", "exec")
except SyntaxError as _e:
    _ln = _e.lineno or 0
    _err = _fmt(_e, _ln)
    _rs = [{"ok": False, "err": _err, "line": _ln, "stdout": ""} for _ in _ts]
else:
    _mod_buf = _io.StringIO()
    try:
        with _cl.redirect_stdout(_mod_buf):
            exec(_user_code_obj, globals())
    except Exception as _e:
        _ln = _user_line(_e)
        _err = _fmt(_e, _ln)
        _mod_out = _mod_buf.getvalue()
        _rs = [{"ok": False, "err": _err, "line": _ln, "stdout": _mod_out} for _ in _ts]
    else:
        _rs = []
        for _t in _ts:
            _buf = _io.StringIO()
            try:
                with _cl.redirect_stdout(_buf):
                    _args = [_t[_k] for _k in _arg_keys]
                    _r = getattr(Solution(), _method_name)(*_args)
                _rs.append({"ok": True, "val": _r, "stdout": _buf.getvalue()})
            except Exception as _e:
                _ln = _user_line(_e)
                _rs.append({"ok": False, "err": _fmt(_e, _ln), "line": _ln, "stdout": _buf.getvalue()})
_result_json = _j.dumps(_rs)
`;

self.onmessage = async (ev) => {
  const msg = ev.data;

  if (msg && msg.type === 'init') {
    try {
      await getPyodide();
      self.postMessage({ type: 'ready' });
    } catch (e) {
      self.postMessage({
        type: 'error',
        message: `Failed to load Python runtime: ${(e && e.message) || e}`,
      });
    }
    return;
  }

  if (msg && msg.type === 'run') {
    let ns = null;
    try {
      const pyodide = await getPyodide();
      // Fresh Python dict for this run — guarantees no state leakage between
      // runs (no stale `Solution`, no mutated globals from a previous run).
      ns = pyodide.toPy({
        _user_code:   msg.code,
        _tests_json:  msg.testsJson,
        _method_name: msg.methodName,
        _arg_keys:    msg.argKeys,
      });
      pyodide.runPython(HARNESS, { globals: ns });
      const resultJson = ns.get('_result_json');
      self.postMessage({ type: 'result', resultJson });
    } catch (e) {
      // Pyodide raises PythonError whose .message includes the full traceback.
      // Keep just the last few lines — that's almost always where the useful
      // info lives (e.g. `SyntaxError: invalid syntax` + line marker).
      const raw = (e && e.message) || String(e);
      const lines = raw.split('\n').filter(Boolean);
      const message = lines.slice(-4).join('\n');
      self.postMessage({ type: 'error', message });
    } finally {
      if (ns) {
        try { ns.destroy(); } catch { /* ignore */ }
      }
    }
    return;
  }
};
