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

const HARNESS = `
import json as _j
_ts = _j.loads(_tests_json)
_rs = []
for _t in _ts:
    try:
        _args = [_t[_k] for _k in _arg_keys]
        _r = getattr(Solution(), _method_name)(*_args)
        _rs.append({"ok": True, "val": _r})
    except Exception as _e:
        _rs.append({"ok": False, "err": f"{type(_e).__name__}: {_e}"})
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
        _tests_json:  msg.testsJson,
        _method_name: msg.methodName,
        _arg_keys:    msg.argKeys,
      });
      pyodide.runPython(msg.code + '\n' + HARNESS, { globals: ns });
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
