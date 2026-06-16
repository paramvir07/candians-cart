import { getStoreData } from "@/actions/store/EditStore.action";
import EditStorePage from "@/components/store/Profile/EditStoreProfileForm";

const page = async () => {
  const StoreData = await getStoreData();

  if (!StoreData.success || !StoreData.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex flex-col gap-2">
          <h2 className="font-bold text-lg">Store not found</h2>
          <div className="flex flex-col text-sm">
            <span className="font-semibold">
              Message:{" "}
              <span className="font-normal">{StoreData.message || "N/A"}</span>
            </span>
            <span className="font-semibold">
              Error Details:{" "}
              <span className="font-normal">{StoreData.error || "N/A"}</span>
            </span>
          </div>
        </div>
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
