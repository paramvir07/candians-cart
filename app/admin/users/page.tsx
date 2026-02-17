import MainOverviewUser from "@/components/admin/users/MainOverviewUser"
import UserTable from "@/components/admin/users/table/UserTable"
import UserList from "@/components/admin/users/UserList"

const page = () => {
  return (
     <div className="flex flex-col gap-5">
    <h1 className="text-2xl mt-5 font-semibold">User Management</h1>
    <p className="text-sm text-muted-foreground">View, edit, and manage all users registered on your platform.</p>

    <MainOverviewUser/>
    <UserList/>
    <UserTable/>
    

      
    </div>
  )
}

export default page