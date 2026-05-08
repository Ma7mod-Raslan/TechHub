import axios from "axios";

const BASE_URL = "https://judge0-ce.p.rapidapi.com/submissions";

const getHeaders = () => ({
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "Content-Type": "application/json",
});

const createSubmission = async ({ source_code, language_id, stdin }) => {
  const { data } = await axios.post(
    `${BASE_URL}?base64_encoded=false&wait=false`,
    {
      source_code,
      language_id,
      stdin,
    },
    { headers: getHeaders() }
  );

  return data.token;
};

const getSubmission = async (token) => {
  const { data } = await axios.get(`${BASE_URL}/${token}`, {
    headers: getHeaders(),
  });

  return data;
};

const waitForResult = async (token) => {
  const delays = [500, 1000, 1000, 1500, 1500, 2000, 2000, 2000, 2000, 2000];
  let attempts = 0;

  while (attempts < delays.length) {
    await new Promise((r) => setTimeout(r, delays[attempts]));

    const result = await getSubmission(token);

    // status.id > 2 means finished (3 = Accepted, 4+ = error states)
    if (result.status.id > 2) return result;

    attempts++;
  }

  throw new Error("Execution timeout");
};

export const executeCode = async ({ source_code, language_id, stdin }) => {
  const token = await createSubmission({ source_code, language_id, stdin });
  const result = await waitForResult(token);

  return {
    output: result.stdout || null,
    error: result.stderr || result.compile_output || null,
    status: result.status.description,
    time: result.time,
    memory: result.memory,
  };
};