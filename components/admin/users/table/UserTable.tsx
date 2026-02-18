import { columns, Payment } from "./column"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Demo data
  return [
    { id: "728ed52f", amount: 100, status: "pending", email: "alice@example.com" },
    { id: "829fd12a", amount: 250, status: "success", email: "bob@example.com" },
    { id: "930ab34b", amount: 180, status: "processing", email: "carol@example.com" },
    { id: "a21bc56c", amount: 75, status: "failed", email: "dave@example.com" },
    { id: "b34cd78d", amount: 320, status: "success", email: "eve@example.com" },
    { id: "c45de89e", amount: 150, status: "pending", email: "frank@example.com" },
    { id: "d56ef90f", amount: 400, status: "success", email: "grace@example.com" },
    { id: "e67fg01g", amount: 220, status: "processing", email: "heidi@example.com" },
  ]
}

export default async function UserTable() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
