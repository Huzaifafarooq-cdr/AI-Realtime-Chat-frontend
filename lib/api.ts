export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const authHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createOrder = async (amount: number) => {
  const res = await fetch(`${API_URL}/payment/create-order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });

  return res.json();
};

export const verifyPayment = async (payload: any) => {
  const res = await fetch(`${API_URL}/payment/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return res.json();
};