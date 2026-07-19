import CashierSidebar from "@canadian-cart/ui/cashier/CashierSlidebar";
import CustomerOrders from "@canadian-cart/ui/shared/users/orders/CustomerOrders";
import { getUserSession } from "@canadian-cart/actions/auth/getUserSession.actions";
import { Cashier } from "@canadian-cart/db/models/cashier/cashier.model";

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
      <CustomerOrders allOrders={true} />
    </>
  );
};

export default page;
