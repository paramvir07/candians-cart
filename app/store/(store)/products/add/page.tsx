import ProductForm from "@/components/store/products/ProductForm";
import { getUserSession } from "@/actions/auth/getUserSession.actions";
import { dbConnect } from "@/db/dbConnect";
import Store from "@/db/models/store/store.model";
import { redirect } from "next/navigation";

const productsAdd = async () => {
  const session = await getUserSession();
  if (!session?.user?.id || session.user.role === "Customer") {
    redirect("/store/login");
  }
  await dbConnect();
  const storeId = await Store.findOne({ userId: session.user.id })
    .select("_id")
    .lean();
  const storeIdString = storeId?._id.toString() || "";
  return (
    <div>
      <ProductForm initialData={null} storeId={storeIdString} role="store" />
    </div>
  );
};

export default productsAdd;
