import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-code-review-agent-a2e9.onrender.com",
});

export const submitReview = (data: any) => API.post("/review/submit", data);
export const getAllReviews = () => API.get("/review/");
export const getReview = (id: string) => API.get(`/review/${id}`);
export const deleteReview = (id: string) => API.delete(`/review/${id}`);