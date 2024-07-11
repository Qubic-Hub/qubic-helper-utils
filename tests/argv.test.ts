import { Functioneer } from "functioneer";
import { addFunctions, runArgv, runBrowser } from "../functions/index";
import { describe, it, expect, jest, test } from "@jest/globals";

describe("runArgv", () => {
  const func = new Functioneer({
    showHelpOnError: true,
    returnJSONString: true,
  });
  addFunctions(func);
  it("should return stringified JSON and error when no function is provided", async () => {
    jest.replaceProperty(process, "argv", ["node", "noFunc"]);

    const output = await runArgv();
    expect(output).toEqual(
      JSON.stringify({
        args: ["node", "noFunc"],
        status: "error",
        error: "No function name provided",
      })
    );
  });

  it("should return stringified JSON and error when function is not found", async () => {
    jest.replaceProperty(process, "argv", [
      "node",
      "noFunc",
      "thisFunctionDoesNotExist",
    ]);

    const output = JSON.parse(await runArgv());
    expect(output["error"]).toContain("thisFunctionDoesNotExist not found");
    //expect(output["status"]).toEqual("error");
  });

  it("should return publicId, public key in B64 and private key in B4 for private seed aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa as a JSON string", async () => {
    jest.replaceProperty(process, "argv", [
      "node",
      "index.js",
      "createPublicId",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ]);
    const output = await runArgv();
    expect(output).toEqual(
      '{"publicId":"BZBQFLLBNCXEMGLOBHUVFTLUPLVCPQUASSILFABOFFBCADQSSUPNWLZBQEXK","publicKeyB64":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQ=","privateKeyB64":"RFNRLx71l7NlzDhPCisQzrXJT1FrkRrMjovBtV5kbHQ=","status":"ok"}'
    );
  });

  it("should return appropriate payload for transfer asset as a JSON string", async () => {
    jest.replaceProperty(process, "argv", [
      "node",
      "index.js",
      "createTransactionAssetMove",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "ASSETNAME",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB",
      "1",
      "10000000",
    ]);
    const output = await runArgv();
    expect(output).toEqual(
      '{"transaction":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBCDwAAAAAAgJaYAAIAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQVNTRVROQU0BAAAAAAAAALeE6hXICPI46k8ivouJv23KLKJ+O/B90RUZb71mAYaPYigkuWpWF3PgLPiIDJGWc21ZXnTuYhlGvvS9V7gIDQA=","status":"ok"}'
    );
  });

  it("should return appropriate payload for transfer funds as a JSON string", async () => {
    jest.replaceProperty(process, "argv", [
      "node",
      "index.js",
      "createTransaction",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "10000",
      "10000000",
    ]);

    const output = await runArgv();
    expect(output).toEqual(
      '{"transaction":"H1kNA+YTvd7Ti0wIIKxEYV+RrxJDWYCz7ePAjDFaJUQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAnAAAAAAAAgJaYAAAAAAALYtCM56ZJoIzY0Iq4MFgeNH/HTNG/fNwEULHczxoEK4dF9CJmYobaRPP1GdGVSBR/a9EEyyVZiasSDfBk/QQA","status":"ok"}'
    );
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

// describe("runBrowser", () => {
//   it("should return result object with 'ok' status if result is successful", async () => {
//     const functionName = "functionName";
//     const args = ["arg1", "arg2"];
//     const result = {
//       success: true,
//       result: { data: "result" },
//     };
//     jest.spyOn(Functioneer.prototype, "run").mockResolvedValueOnce(result);

//     const output = await runBrowser(functionName, ...args);

//     expect(output).toEqual({ ...result.result, status: "ok" });
//     expect(Functioneer.prototype.run).toHaveBeenCalledWith(functionName, args);
//   });

//   it("should return result object with 'error' status if result is not successful", async () => {
//     const functionName = "functionName";
//     const args = ["arg1", "arg2"];
//     const result = {
//       success: false,
//       message: "An error has occurred",
//     };
//     jest.spyOn(Functioneer.prototype, "run").mockResolvedValueOnce(result);

//     const output = await runBrowser(functionName, ...args);

//     expect(output).toEqual({ status: "error", error: result.message });
//     expect(Functioneer.prototype.run).toHaveBeenCalledWith(functionName, args);
//   });
// });
