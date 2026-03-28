import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

const HtmlErrorPage = () => {
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const htmlContent = decodeURIComponent(queryParams.get("content") || "No error content provided.");
  // // const payloadContent = decodeURIComponent(queryParams.get("payload") || "No frontend payload provided.");
  // const url = decodeURIComponent(queryParams.get("url") || "No base url provided.");
  // const method = decodeURIComponent(queryParams.get("method") || "No method provided.");
  // const htmlContent = JSON.parse(sessionStorage.getItem("htmlContent"))
  // const payloadContent = decodeURIComponent(JSON.parse(sessionStorage.getItem("payloadContent")))
  const url = JSON.parse(sessionStorage.getItem("url")) || "";
  const method = JSON.parse(sessionStorage.getItem("method")) || "";
  const htmlContent = JSON.parse(sessionStorage.getItem("htmlContent")) || "";
  const jsonFormData = JSON.parse(sessionStorage.getItem("jsonFormData")) || {};
  const objectPayload =
    JSON.parse(sessionStorage.getItem("objectPayload")) || {};
  const arrayPayload = JSON.parse(sessionStorage.getItem("arrayPayload")) || {};
  const files = JSON.parse(sessionStorage.getItem("files")) || {};
  const token = JSON.parse(sessionStorage.getItem("token")) || "";

  console.log(htmlContent, "htmlContent");
  console.log(jsonFormData, "jsonData");
  console.log(objectPayload, "object data");
  console.log(arrayPayload, "array data");
  console.log(method, "method");
  console.log(url, "url");

  const navigate = useNavigate();

  // let parsedPayload;
  // try {
  //   console.log(typeof payloadContent);
  //   console.log(payloadContent);

  //   parsedPayload = typeof payloadContent === 'string' ? JSON.parse(payloadContent) : payloadContent;
  // } catch (e) {
  //   console.error("Error parsing payload:", e);
  //   parsedPayload = { error: "Failed to parse frontend payload." };
  // }

  const handleCopy = (e, type) => {
    e.preventDefault();

    let dataToCopy = {};

    if (type === "payload") {
      dataToCopy = { ...jsonFormData, ...arrayPayload, ...objectPayload };
    } else if (type === "token") {
      // Example: Retrieve token data from session storage (assuming it's stored under "token")
      dataToCopy = sessionStorage.getItem("token") || "";
    } else if (type === "baseUrl") {
      dataToCopy = url || "";
    } else if (type === "response") {
      dataToCopy = htmlContent || "";
    }
    const dataString =
      typeof dataToCopy === "object"
        ? JSON.stringify(dataToCopy, null, 2)
        : dataToCopy;
    navigator.clipboard
      .writeText(dataString)
      .then(() => {
        alert(
          `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`,
        );
      })
      .catch(() => {
        alert(`Failed to copy ${type}.`);
      });
  };

  const modifiedHtmlContent = htmlContent
    .replace(
      /<pre>/g,
      '<div style="white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">',
    )
    .replace(/<\/pre>/g, "</div>");

  const handleBack = () => {
    window.history.replaceState(null, "", document.referrer);
    navigate(-1);
  };

  return (
    <div className="h-auto p-4 font-roboto bg-gray-100 w-full">
      <Helmet>
        <title>Error - Something Went Wrong</title>
      </Helmet>
      <h1 className="text-xl font-bold text-red-500 mb-4">Error Details</h1>
      <div className="flex gap-5 ">
        <div className="mb-6 w-[50%] border-e-2 border-black">
          <h2 className="text-lg font-semibold text-gray-700">
            Frontend Request :
          </h2>
          <div style={{ padding: "20px" }} className="flex flex-col gap-5">
            <div className="w-full justify-between items-center flex">
              <h1>URL with End Point:</h1>
              <p
                className="hover:cursor-pointer hover:underline hover:text-blue-500"
                onClick={(e) => handleCopy(e, "baseUrl")}
              >
                Copy Url
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f4f4f4",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <h1>
                <strong>Domain Url with End Point</strong>: <span>{url}</span>
              </h1>
              <h1>
                <strong>Method</strong>: <span>{method}</span>
              </h1>
            </div>
            <div className="w-full justify-between items-center flex">
              <h1>Payload:</h1>
              <p
                className="hover:cursor-pointer hover:underline hover:text-blue-500"
                onClick={(e) => handleCopy(e, "token")}
              >
                Copy Token
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f4f4f4",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <h1>
                <strong>Token</strong>: <span>{token}</span>
              </h1>
              {/* <h1><strong>Method</strong>: <span>{method}</span></h1> */}
            </div>
            <div className="w-full justify-between items-center flex">
              <h1>Payload:</h1>
              <p
                className="hover:cursor-pointer hover:underline hover:text-blue-500"
                onClick={(e) => handleCopy(e, "payload")}
              >
                Copy Payload
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#f4f4f4",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <ul>
                {Object.entries(jsonFormData).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong>
                    {typeof value === "object" ? JSON.stringify(value) : value}
                  </li>
                ))}
              </ul>
              <ul>
                {Object.entries(objectPayload).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong>
                    {typeof value === "object" ? JSON.stringify(value) : value}
                  </li>
                ))}
              </ul>
              <ul>
                {Object.entries(arrayPayload).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong>
                    {typeof value === "object" ? JSON.stringify(value) : value}
                  </li>
                ))}
              </ul>
              <ul>
                {Array.isArray(files) && files.length > 0 && (
                  // Render if files is a non-empty array
                  <>
                    {files.map((item, index) => (
                      <li key={index}>
                        <strong>Item {index + 1}:</strong>
                        {typeof item === "object" ? JSON.stringify(item) : item}
                      </li>
                    ))}
                  </>
                )}

                {!Array.isArray(files) &&
                  typeof files === "object" &&
                  files !== null && (
                    // Render if files is an object (and not an array)
                    <>
                      {Object.entries(files).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : value}
                        </li>
                      ))}
                    </>
                  )}
              </ul>
            </div>
            {/* <h1>Payload 2</h1>
          <div style={{
            backgroundColor: "#f4f4f4",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            <ul>
              {Object.entries(resultObject).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {renderValue(value)}
                </li>
              ))}
            </ul>
          </div> */}
          </div>
        </div>

        <div className="w-[50%]">
          <h2 className="text-lg font-semibold text-gray-700">
            Backend Response :{" "}
          </h2>
          <p
            className="w-full flex justify-end hover:cursor-pointer hover:text-blue-600 hover:underline"
            onClick={(e) => handleCopy(e, "response")}
          >
            Copy Response
          </p>
          <div style={{ padding: "20px" }}>
            <div
              style={{
                backgroundColor: "#f4f4f4",
                padding: "15px 15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontFamily: "monospace",
                wordBreak: "break-word",
              }}
            >
              <div
                className="break-words flex flex-wrap space-x-4"
                style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                dangerouslySetInnerHTML={{ __html: modifiedHtmlContent }}
              />
              <div>
                <button
                  onClick={handleBack}
                  className="text-blue-500 underline cursor-pointer text-xl"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlErrorPage;
