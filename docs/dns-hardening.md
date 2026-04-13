# DNS Hardening Runbook

These records live at the DNS provider (Vercel DNS, Cloudflare, Route53, etc.), not in this repo. Apply them manually after launch and verify with `dig`.

Replace `leetcodelockin.com` with the production domain.

---

## 1. CAA — restrict which CAs can issue certs

Stops a compromised or mis-issuing CA from minting a valid cert for the domain. Vercel provisions certs through Let's Encrypt for custom domains; verify via `dig CAA leetcodelockin.com` after a Vercel cert has been issued and pin whichever CA(s) Vercel actually uses.

```
leetcodelockin.com.  CAA  0 issue "letsencrypt.org"
leetcodelockin.com.  CAA  0 issuewild ";"
leetcodelockin.com.  CAA  0 iodef "mailto:security@leetcodelockin.com"
```

- `issue "letsencrypt.org"` — only Let's Encrypt may issue non-wildcard certs
- `issuewild ";"` — no CA may issue wildcard certs (app does not use them)
- `iodef` — where CAs report violations (replace with a real inbox, or drop the line)

If Vercel ever rotates to a different CA, re-run `dig CAA` and add the new issuer. A stale CAA will cause cert renewals to fail silently — set a calendar reminder to re-verify every 6 months.

## 2. SPF — block email spoofing of the domain

The app does not send email from its own domain (Supabase Auth sends from `noreply@mail.supabase.io`). Hard-fail any mail claiming to come from `@leetcodelockin.com`:

```
leetcodelockin.com.  TXT  "v=spf1 -all"
```

When/if transactional email is added via Resend or Postmark, swap for:

```
leetcodelockin.com.  TXT  "v=spf1 include:_spf.resend.com -all"
```

## 3. DMARC — enforce SPF/DKIM alignment with hard reject

```
_dmarc.leetcodelockin.com.  TXT  "v=DMARC1; p=reject; adkim=s; aspf=s; rua=mailto:dmarc@leetcodelockin.com; fo=1"
```

- `p=reject` — receivers hard-reject any mail that fails alignment
- `adkim=s; aspf=s` — strict alignment (subdomains don't inherit)
- `rua` — aggregate reports; replace with a real inbox or drop if you don't want them
- `fo=1` — forensic reports on any failure

Start with `p=none` for 1-2 weeks if you want to observe reports first, then move to `p=reject`.

## 4. DNSSEC — enable in the DNS provider UI

One-click in Cloudflare, Vercel DNS, Route53. After enabling, the provider emits a DS record that must be uploaded to the registrar. Skipping the registrar step leaves DNSSEC half-configured and does nothing.

Verify with:

```
dig DS leetcodelockin.com +short
```

A non-empty response means the registrar has published the DS record and DNSSEC is live.

## 5. Skipped deliberately

- **MTA-STS / TLS-RPT** — only matters when the domain sends/receives email
- **HPKP** — deprecated, do not add
- **Expect-CT** — deprecated, do not add

---

## Verification commands

Run after applying records. Each should return exactly the values set above.

```bash
dig CAA leetcodelockin.com +short
dig TXT leetcodelockin.com +short               # SPF
dig TXT _dmarc.leetcodelockin.com +short         # DMARC
dig DS leetcodelockin.com +short                 # DNSSEC (non-empty == enabled)
```

For a deeper audit, paste the domain into:
- https://dnssec-analyzer.verisignlabs.com/
- https://mxtoolbox.com/SuperTool.aspx (DMARC, SPF, DNSSEC tabs)
- https://ssl-tools.net/caa (CAA check)
