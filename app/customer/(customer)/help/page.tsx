import { getUser } from "@/actions/customer/User.action";
import HelpForm from "@/components/customer/help/HelpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
};


export default async function HelpPage() {

let email = '';
const User = await getUser();
if(!User) return email;
email = User.email;

  return <HelpForm userEmail={email}/>
}