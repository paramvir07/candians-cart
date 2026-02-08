import { ArrowLeft } from "lucide-react";
import { useSetAtom } from "jotai";
import { agreementCompAtom } from "@/atoms/customer/home";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Agreement = () => {
  const setAgreementComp = useSetAtom(agreementCompAtom);
  return (
    <>
      <div className="text-muted-foreground text-sm text-center">
        Please review and accept our terms to continue.
      </div>
      <ScrollArea className="h-30 border rounded-tr-md rounded-tl-md p-4 text-sm text-muted-foreground -mb-4">
        <div>
          Welcome to Candian's Cart. By using our service, you agree to these
          terms. You must provide a valid referral code to register.
        </div>
        <div>
          Our platform connects families for grocery delivery. We are not
          responsible for the quality of goods but will facilitate communication
          between users and vendors.
        </div>
        <div>
          Payments are processed securely. All personal information is handled
          as per our Privacy Policy. You can find the full details by clicking
          the link below.
        </div>
      </ScrollArea>

      <div className="border-x border-b rounded-br-md rounded-bl-md flex flex-col justify-center text-[12px] text-primary p-2 w-full">
        <div className="cursor-pointer">
          <a href="#" className="text-primary">
            Read full terms and conditions
          </a>
        </div>
        <div className="cursor-pointer">
          <a href="#">Advertising & Usage Policy for Partners</a>
        </div>
        <div className="cursor-pointer">
          <a href="#">Community Support & Product Launch Policy</a>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 w-full">
        <Button
          variant="secondary"
          className="cursor-pointer w-33"
          onClick={() => setAgreementComp(false)}
        >
          <ArrowLeft />
          Back
        </Button>
        <Button className="cursor-pointer w-33">Agree & Continue</Button>
      </div>
    </>
  );
};

export default Agreement;
