# UI fonts

Unmodified font files, bundled locally so Next.js builds do not depend on a
font service or its generated font URLs.

- Exo 2 (variable), from the Google Fonts repository on 8 October 2026:
  https://github.com/google/fonts/tree/main/ofl/exo2 — `exo-2-OFL.txt`
- Monaspace Xenon Regular and SemiBold, from the official Monaspace v1.400
  static web font release (`monaspace-webfont-static-v1.400.zip`) on
  10 October 2026: https://github.com/githubnext/monaspace/releases/tag/v1.400 —
  `monaspace-OFL.txt`. Files are renamed only; their contents are unchanged.
  "Monaspace" is a Reserved Font Name, so subset or otherwise modified copies
  must not keep that name.

- Cinzel SemiBold, from the Realms brand deck v3 (`realms-branding/output/brand-deck/fonts/`)
  on 2 November 2026. The file is unchanged. — `cinzel-OFL.txt`

All three fonts are distributed under the SIL Open Font License 1.1. Keep the respective
license files with the fonts when redistributing them.

SHA-256 checksums:

- `exo-2-variable.ttf`: `205a448676a2586f9c57c25f3d5c58ca8db7e6cf5edf7506783a010c6fe2bfb5`
- `monaspace-xenon-400.woff2` (`MonaspaceXenon-Regular.woff2`): `eb34d971e2bf956230ba2e5bd621af7310d4c739057ae7df7b8a38ca95b03cf6`
- `monaspace-xenon-600.woff2` (`MonaspaceXenon-SemiBold.woff2`): `7772439b105e2eb3d6104f33757fbddd3e4db334f9ff61ffdbf654c0babc3c7c`
- `Cinzel-SemiBold.ttf`: `5150b3609eeaaa9c6d7e093cb9b16ab8ec2f7110ddf0cbe751887e6f158398af`

## Static share-card instances

`next/og` (Satori) cannot parse variable fonts, so share images use static
instances derived from `exo-2-variable.ttf` with fontTools 4.60.1. They are not
used by the site itself.

```sh
fonttools varLib.instancer exo-2-variable.ttf wght=400 --static --update-name-table -o exo-2-400-static.ttf
fonttools varLib.instancer exo-2-variable.ttf wght=600 --static --update-name-table -o exo-2-600-static.ttf
```

- `exo-2-400-static.ttf`: `742821abd29d141d9d37327b012a19dfbb6ae2eab76bd379583711ff2bf4fdc0`
- `exo-2-600-static.ttf`: `877523290a192adf7de45e8a9118dfc217320876de12b03a4495af5b98eea5ea`

The display face `../im-fell-english-sc-regular.ttf` is already static.
