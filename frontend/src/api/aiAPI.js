export const getLatest = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/latest`);

    if (!res.ok) {
      throw new Error("API failed");
    }

    return await res.json();
  } catch (error) {
    console.error("API ERROR:", error);
    return null; // IMPORTANT
  }
};