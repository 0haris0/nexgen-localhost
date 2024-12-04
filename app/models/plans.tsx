import dbServer from "../db.server";

export const getPlan = async (planName) => {
  let planId;
  switch (planName) {
    case "Trial":
      planId = 1;
      break;
    case "Basic plan":
      planId = 2;
      break;
    case "Professional plan":
      planId = 3;
      break;
    case "Enterprise plan":
      planId = 4;
      break;
    default:
      planId = 1;
  }
  const getPlanData = await dbServer.plan.findFirst({
    where: {
      id: planId,
    },
  });
  return getPlanData;
};
