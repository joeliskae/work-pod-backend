/**
 * Luo yhtenäisen onnistuneen API-vastauksen rakenteen.
 *
 * @template T Tietotyyppi, joka vastauksen `data`-kenttään sijoitetaan.
 * @param {T} data Varsinainen vastauksen sisältö (esim. objekti, lista, jne.)
 * @param {string} [message] (Valinnainen) viesti, joka liitetään mukaan `message`-kenttään.
 * @returns {{ success: true, data: T, message?: string }} Onnistunut vastausobjekti.
 *
 * @example
 * wrapSuccessResponse({ userId: 1 });
 * // { success: true, data: { userId: 1 } }
 *
 * @example
 * wrapSuccessResponse(["item1", "item2"], "Haku onnistui");
 * // { success: true, data: ["item1", "item2"], message: "Haku onnistui" }
 */
export function wrapSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}
