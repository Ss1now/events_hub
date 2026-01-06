
import Sidebar from "@/components/admincomponents/sidebar";
import { assets } from "@/assets/assets";
import Image from "next/image";

export default function Layout({children}){
    return (
        <>
            <div className="flex">
            <Sidebar/>
            <div className='flex flex-col w-full'>
                <div className='flex items-center justify-between w-full py-3 max-h-[60px] px-12 border-b border-black'> 
                    <h3 className='font-medium'>Admin Panel</h3>
                    <Image src={assets.profile} width={40} alt=''/>
                </div>
                {children}
            </div>
            </div>
        </>
    )

}