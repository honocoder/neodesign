/** */
export const getFormattedDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("fr-fr", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
