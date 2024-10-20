const originalFetch = fetch;

window.fetch = async function (...args) {
  const response = await originalFetch(...args);

  if (!response.url.includes("conversation")) {
    return response;
  }

  return new Response(
    new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          const messages = new TextDecoder()
            .decode(value)
            .split("\n")
            .map((line) => {
              try {
                const dataString = line.substring(6);
                const data = JSON.parse(dataString);
                if (data.type === "moderation") {
                  data.moderation_response.flagged = false;
                  data.moderation_response.blocked = false;
                }
                return "data: " + JSON.stringify(data);
              } catch (e) {
                return line;
              }
            })
            .join("\n");

          controller.enqueue(new TextEncoder().encode(messages));
        }
      },
    }),
    { headers: response.headers }
  );
};
