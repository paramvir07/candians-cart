import MainOverviewUser from "@/components/shared/users/MainOverviewUser";
import UserTable from "@/components/shared/users/table/UserTable";
import UserList from "@/components/shared/users/UserList";

const page = () => {
  return (
    <div className="flex flex-col gap-5 px-8">
      <h1 className="text-2xl mt-5 font-semibold">User Management</h1>
      <p className="text-sm text-muted-foreground">
        View, edit, and manage all users registered on your platform.
      </p>

      {/* <MainOverviewUser />
      <UserList />
      <UserTable /> */}
    </div>
  );
};

export default page;
