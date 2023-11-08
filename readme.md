# Qubic Helper Utilities

Conversion of the QubicHelper as provided in https://github.com/qubic-li/wallet to an executable so as to be used in Windows, Linux and Mac desktops. Most probably a rust version of the Kangaroo12 and other implementations would be better but this will suffice for now.

Everything is packaged by pkg and turned in an executable (thus 35M in size per platform).

## Usage

The application responds with JSON in stdout:

### Get the public ID from a seed

`qubic-helper createPublicId aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa `

Will result in :
`{"status":"ok","publicId":"BZBQFLLBNCXEMGLOBHUVFTLUPLVCPQUASSILFABOFFBCADQSSUPNWLZBQEXK"}`

### Get base64 of a transaction

`qubic-helper createTransaction aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA 10000 10000000`
Will result in :
`{"status":"ok","transaction":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAnAAAAAAAAgJaYAAAAAAALYtCM56ZJoIzY0Iq4MFgeNH/HTNG/fNwEULHczxoEK4dF9CJmYobaRPP1GdGVSBR/a9EEyyVZiasSDfBk/QQA"}`

### Error handling

Errors will result in
`{"status":"error","error":"Error description"}`

## Development info

Everything is written in Typescript (and some javascript). Typescript is transpiled to Javascript and then bundled to a single file with esbuild. The esbuild generated file is the fed to pkg and the executables are created

## Compilation

1. Run npm install.
2. npm run bundle
3. npm run build-windows
4. npm run build-mac
5. npm run build-mac-arm
6. npm run build-linux
