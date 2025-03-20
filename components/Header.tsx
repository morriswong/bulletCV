import Link from "next/link";
import Github from "./GitHub";

export default function Header() {
    return (
        <header className="flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2">
            <Link href="/" className="flex space-x-3">
                <img
                    alt="header text"
                    src="/write.svg"
                    className="sm:w-9 sm:h-9 w-8 h-8"
                />
                <h1 className="sm:text-3xl text-2xl font-bold ml-2 tracking-tight">
                    BulletCV
                </h1>
            </Link>
            <a 
                href='https://ko-fi.com/T6T712RPB7' 
                target='_blank'
                className="border-none"
            >
                <img 
                    src='https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_beige.png?v=6' 
                    alt='Buy Me a Coffee at ko-fi.com'
                    className="h-[36px] w-auto"
                />
            </a>
        </header>
    );
}