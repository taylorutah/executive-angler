import { redirect } from 'next/navigation';

export default function WorkbenchPage() {
  redirect('/my-flies?tab=workbench');
}
