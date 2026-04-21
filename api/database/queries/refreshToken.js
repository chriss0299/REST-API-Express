import pool from "../connessione.js";

export async function salvaRefreshToken(utenteId, token, scadenza) {
  await pool.query(
    "INSERT INTO refresh_token (utenteId, token, scadenza) VALUES (?, ?, ?)",
    [utenteId, token, scadenza],
  );
}

export async function trovaRefreshToken(token) {
  const [righe] = await pool.query(
    "SELECT * from refresh_token where token = ?",
    [token],
  );
  return righe[0];
}

export async function eliminaRefreshToken(token) {
  const token_reffresh = await trovaRefreshToken(token);
  if (!token_reffresh) return null;

  await pool.query("DELETE FROM refresh_token WHERE token = ?", [token]);
  return token_reffresh;
}
