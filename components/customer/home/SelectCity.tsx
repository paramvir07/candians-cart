import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { useSetAtom } from "jotai";
import { agreementCompAtom } from "@/atoms/customer/home";
import { Button } from "@/components/ui/button";

const SelectCity = () => {
  const setAgreementComp = useSetAtom(agreementCompAtom);
  return (
    <>
      <div className="text-muted-foreground text-sm text-center">
        First, please select your city to get started.
      </div>
      <Select defaultValue="abbotsford-bc">
        <SelectTrigger className="w-full cursor-pointer">
          <SelectValue placeholder="Select a city" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select a city</SelectLabel>
            <SelectItem value="abbotsford-bc" className="cursor-pointer">
              <MapPin />
              Abbotsford, BC
            </SelectItem>
            <div className="text-xs p-2">
              Will be reaching other cities soon
            </div>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        className="w-full cursor-pointer"
        onClick={() => setAgreementComp(true)}
      >
        Continue
      </Button>
    </>
  );
};

export default SelectCity;
