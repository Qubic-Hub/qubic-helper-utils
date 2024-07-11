import { Functioneer } from "functioneer";
import { addFunctions, runArgv, runBrowser } from "../functions/index";
import { describe, it, expect, jest, test } from "@jest/globals";

describe("runObj", () => {
  const func = new Functioneer({
    showHelpOnError: true,
    returnJSONString: true,
  });
  addFunctions(func);
  it("should return object and error when no function is provided", async () => {
    const output = await runBrowser("");
    expect(output.status).toEqual("error");
  });

  it("should return object and error when function is not found", async () => {
    jest.replaceProperty(process, "argv", [
      "node",
      "noFunc",
      "thisFunctionDoesNotExist",
    ]);

    const output = await runBrowser("thisFunctionDoesNotExist", "param");

    expect(output["error"]).toEqual(
      "Function thisFunctionDoesNotExist not found "
    );
  });

  it("should return publicId, public key in B64 and private key in B4 for private seed aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa as object", async () => {
    jest.replaceProperty(process, "argv", [
      "node",
      "index.js",
      "createPublicId",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);
    const output = await runBrowser(
      "createPublicId",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    expect(output).toEqual({
      publicId: "BZBQFLLBNCXEMGLOBHUVFTLUPLVCPQUASSILFABOFFBCADQSSUPNWLZBQEXK",
      publicKeyB64: "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQ=",
      privateKeyB64: "RFNRLx71l7NlzDhPCisQzrXJT1FrkRrMjovBtV5kbHQ=",
      status: "ok",
    });
  });

  it("should return appropriate payload for transfer asset as object", async () => {
    const output = await runBrowser(
      "createTransactionAssetMove",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "ASSETNAME",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB",
      "1",
      "10000000"
    );

    expect(output).toEqual({
      transaction:
        "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBCDwAAAAAAgJaYAAIAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQVNTRVROQU0BAAAAAAAAALeE6hXICPI46k8ivouJv23KLKJ+O/B90RUZb71mAYaPYigkuWpWF3PgLPiIDJGWc21ZXnTuYhlGvvS9V7gIDQA=",
      status: "ok",
    });
  });

  it("should return appropriate payload for transfer funds as boject", async () => {
    const output = await runBrowser(
      "createTransaction",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "10000",
      "10000000"
    );
    expect(output).toEqual({
      transaction:
        "H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAnAAAAAAAAgJaYAAAAAAALYtCM56ZJoIzY0Iq4MFgeNH/HTNG/fNwEULHczxoEK4dF9CJmYobaRPP1GdGVSBR/a9EEyyVZiasSDfBk/QQA",
      status: "ok",
    });
  });

  //   it("should return JSON string with 'ok' status if result is successful", async () => {
  //     const argv = ["node", "index.js", "functionName", "arg1", "arg2"];
  //     const result = {
  //       success: true,
  //       result: JSON.stringify({ data: "result" }),
  //     };

  //     jest.replaceProperty(process, "argv", ["node", "aaa"]);

  //     // jest.
  //     // spyOn(Functioneer.prototype, "runArgv") // Use the 'spyOn' function
  //     //     .mockResolvedValueOnce(JSON.stringify(result));

  //     const output = await runArgv();

  //     expect(output).toEqual(JSON.stringify({ data: "result", status: "ok" }));
  //     expect(Functioneer.prototype.runArgv).toHaveBeenCalledWith(argv);
  //   });

  //   it("should return JSON string with 'error' status if result is not successful", async () => {
  //     const argv = ["node", "index.js", "functionName", "arg1", "arg2"];
  //     const result = {
  //       success: false,
  //       message: "An error has occurred",
  //     };
  //     jest
  //       .spyOn(Functioneer.prototype, "runArgv")
  //       .mockResolvedValueOnce(JSON.stringify(result));

  //     const output = await runArgv();

  //     expect(output).toEqual(
  //       JSON.stringify({
  //         args: argv,
  //         status: "error",
  //         error: "An error has occurred",
  //       })
  //     );
  //     expect(Functioneer.prototype.runArgv).toHaveBeenCalledWith(argv);
  //   });
});
