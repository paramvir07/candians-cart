import { createAuth } from "@canadian-cart/lib/auth/auth";
import { VerifyEmail } from "@canadian-cart/ui/EmailTemplates/VerifyEmail";
import { revalidateCustomerCache } from "@canadian-cart/actions/cache/user.cache";

export const { auth, db } = createAuth({
  renderVerifyEmail: (props) => <VerifyEmail {...props} />,
  revalidateCustomerCache,
});