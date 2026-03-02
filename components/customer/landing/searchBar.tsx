import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="w-full flex">
      <Input
        type="text"
        placeholder="Search..."
        className="rounded-r-none hidden md:inline-flex w-full"
      />
      <Button variant={'outline'} className="rounded-full md:rounded-l-none px-4">
        <Search className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default SearchBar;