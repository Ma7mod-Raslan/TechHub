import axios from "axios";

const BASE_URL = "https://judge0-ce.p.rapidapi.com/submissions";

const headers = {
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "Content-Type": "application/json"
};

const createSubmission = async ({ source_code, language_id, stdin }) => {
  const { data } = await axios.post(
    `${BASE_URL}?base64_encoded=false&wait=false`,
    {
      source_code,
      language_id,
      stdin
    },
    { headers }
  );

  return data.token;
};

const getSubmission = async (token) => {
  const { data } = await axios.get(`${BASE_URL}/${token}`, {
    headers
  });

  return data;
};

const waitForResult = async (token) => {
  let attempts = 0;

  while (attempts < 10) {
    const result = await getSubmission(token);

    if (result.status.id > 2) return result;

    await new Promise((r) => setTimeout(r, 1000));
    attempts++;
  }

  throw new Error("Execution timeout");
};

export const executeCode = async ({
  source_code,
  language_id,
  stdin
}) => {
  const token = await createSubmission({
    source_code,
    language_id,
    stdin
  });

  const result = await waitForResult(token);

  return {
  output: result.stdout || null,
  error: result.stderr || result.compile_output || null,
  status: result.status.description,
  time: result.time,
  memory: result.memory
};

};