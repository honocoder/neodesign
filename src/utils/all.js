/** */
// export const getFormattedDate = (date) =>
//   date
//     ? new Date(date).toLocaleDateString("fr-FR", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "2-digit",
//       })
//     : "";

export const getFormattedDate = (date) =>
  date ? new Date(date).getFullYear().toString() : "";
