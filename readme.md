# Qubic Helper Utilities

Conversion of the Qubic Ts-Library https://github.com/qubic/ts-library to an executable so as to be used in Windows, Linux and Mac desktops and to a packaged html (so it can be used in a web RPC proxy).
Most probably a rust version of the Kangaroo12 and other implementations would be better but this will suffice for now.

## Compilation

`npm run build` will build the index.html , and windows , mac and linux files

## Usage

The application responds with JSON in stdout:

### Get the public ID from a seed

`qubic-helper createPublicId aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`

Will result in :
`{"publicId":"BZBQFLLBNCXEMGLOBHUVFTLUPLVCPQUASSILFABOFFBCADQSSUPNWLZBQEXK","publicKeyB64":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQ=","privateKeyB64":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQ=","status":"ok"}``

in browser:
await qInterface.getPublicId("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

will result in
`{
    "publicId": "BZBQFLLBNCXEMGLOBHUVFTLUPLVCPQUASSILFABOFFBCADQSSUPNWLZBQEXK",
    "publicKeyB64": "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQ=",
    "privateKeyB64": "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQ="
}`

### Get base64 of a transaction

`qubic-helper createTransaction aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA 10000 10000000`
createTransaction sourceSeed destinationId numberOfAssets tick

Will result in :
`{"transaction":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAnAAAAAAAAgJaYAAAAAAALYtCM56ZJoIzY0Iq4MFgeNH/HTNG/fNwEULHczxoEK4dF9CJmYobaRPP1GdGVSBR/a9EEyyVZiasSDfBk/QQA","status":"ok"}`

in browser:

await qInterface.getTransaction("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",10000,10000000);

will result in

`{
    "transaction": "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAnAAAAAAAAgJaYAAAAAAALYtCM56ZJoIzY0Iq4MFgeNH/HTNG/fNwEULHczxoEK4dF9CJmYobaRPP1GdGVSBR/a9EEyyVZiasSDfBk/QQA"
}`

### Get the base64 of a transaction for asset transfer

createTransactionAssetMove sourceSeed destinationId AssetName AssetIssuer NumberOfAssets Tick
`qubic-helper createTransactionAssetMove aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA ASSETNAME AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB 1 10000000`
Will result in :
`{"transaction":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBCDwAAAAAAgJaYAAIAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9ZDQPmE73e04tMCCCsRGFfka8SQ1mAs+3jwIwxWiVEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBU1NFVE5BTQEAAAAAAAAAB5VPXT0C+u/84ar4IftHP+zS4xGyDMLfje6Huux5J19ZmqCJ1ChRPPyjurE/EiheN3hQWYZCubRsWwSxX4kZAA==","status":"ok"}`
``

in browser
await qInterface.getAssetTransferTransaction("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","ASSETNAME","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB",1,10000000);

will result in:
`{
    "transaction": "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBCDwAAAAAAgJaYAAIAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQVNTRVROQU0BAAAAAAAAALeE6hXICPI46k8ivouJv23KLKJ+O/B90RUZb71mAYaPYigkuWpWF3PgLPiIDJGWc21ZXnTuYhlGvvS9V7gIDQA="
}`

### Error handling

Errors will result in
`{"status":"error","error":"Error description"}`

## Development info

- Everything is written in Typescript (and some javascript). Typescript is transpiled to Javascript and then bundled to a single file with esbuild. The esbuild generated file is the fed to pkg and the executables are created.
- index.html contains the packaged dependencies in one single file. The window object is enhanced with a new instance of QubicInterface
