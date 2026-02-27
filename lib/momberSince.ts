export const getMemberYear = (createdAt :  Date ) => {
  const memberYear = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();
  return memberYear;
};

export const getMemberSince = (createdAt: Date ) => {
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";
  return memberSince;
};
