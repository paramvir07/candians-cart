import CashierSidebar from "@/components/cashier/CashierSlidebar";
import UserList from "@/components/shared/users/UserList";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { Cashier } from "@/db/models/cashier/cashier.model";

const page = async () => {
  const session = await getUserSession();
  const cashierAuthId = session.user.id;
  const cashierData = await Cashier.findOne({ userId: cashierAuthId })
    .select("name email")
    .lean();
  if (!cashierData) {
    throw new Error("Cashier data not found");
  }

  const cashierProps = {
    name: cashierData.name,
    email: cashierData.email,
  };

  return (
    <>
      <CashierSidebar cashierData={cashierProps} />
      <div className="flex-1 p-6 md:ml-18">
        <UserList userRole="cashier" />{" "}
      </div>
    </>
  );
};

export default page;
