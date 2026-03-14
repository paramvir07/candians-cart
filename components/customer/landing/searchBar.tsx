
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="w-full flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-2 hover:border-primary/30 transition-colors">
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder="Search..."
        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default SearchBar;