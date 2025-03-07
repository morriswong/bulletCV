import { Switch } from "@headlessui/react";
import Image from "next/image";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Toggle({ isDemo, setIsDemo }: any) {
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch.Label
        as="span"
        className="mr-3 text-sm flex justify-center gap-2 items-center"
      >
        <span
          className={`font-medium ${isDemo ? "text-gray-400" : "text-gray-900"}`}
        >
          Your Job Description
        </span>{" "}
      </Switch.Label>
      <Switch
        checked={isDemo}
        onChange={setIsDemo}
        className={classNames(
          isDemo ? "bg-black" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            isDemo ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
      <Switch.Label
        as="span"
        className="ml-3 text-sm flex justify-center gap-2 items-center"
      >
        <span
          className={`font-medium ${!isDemo ? "text-gray-400" : "text-gray-900"}`}
        >
          Sample Job Description
        </span>{" "}
      </Switch.Label>
    </Switch.Group>
  );
}