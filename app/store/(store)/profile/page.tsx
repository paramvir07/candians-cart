import { getStoreData } from "@/actions/store/EditStore.action";
import EditStorePage from "@/components/store/Profile/EditStoreProfileForm";

const page = async () => {
  const StoreData = await getStoreData();

  if (!StoreData.success || !StoreData.data) {
    return (
      <div className="p-6">
        Store not found
      </div>
    );
  }
  return (
    <div>
      <EditStorePage Data={StoreData.data} />
    </div>
  );
};

export default page;