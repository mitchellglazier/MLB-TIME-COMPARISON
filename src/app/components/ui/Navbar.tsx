import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <div className="bg-[#295a8e] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link href="/">TRUMEDIA</Link>
        </div>
        <div className="space-x-4">
        <Link
  href="https://github.com/mitchellglazier/MLB-TIME-COMPARISON"
  target="_blank"
  rel="noopener noreferrer"
  className="text-white hover:text-gray-400"
>
  Project's Github
</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
