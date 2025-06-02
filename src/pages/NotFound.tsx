import * as React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const NotFound = () => {
  const location = useLocation();
  const [showDialog, setShowDialog] = React.useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    setShowDialog(true);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="enterprise-card max-w-lg w-full text-center animate-fade-in">
        <div className="enterprise-card-header">
          <h1 className="text-6xl font-extrabold text-blue-600 mb-2">404</h1>
          <p className="text-2xl text-gray-700 mb-4 font-semibold">
            Page Not Found
          </p>
        </div>
        <div className="enterprise-card-content">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Oops! This page does not exist.</AlertTitle>
            <AlertDescription>
              The page{" "}
              <span className="font-mono text-blue-700">
                {location.pathname}
              </span>{" "}
              could not be found.
              <br />
              Please check the URL or return to the dashboard.
            </AlertDescription>
          </Alert>
          <a href="/" className="lovable-button-primary inline-block mt-2">
            Return to Dashboard
          </a>
        </div>
      </div>
      {/* Optional: Modal dialog for 404 */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>404 - Page Not Found</AlertDialogTitle>
            <AlertDialogDescription>
              The page{" "}
              <span className="font-mono text-blue-700">
                {location.pathname}
              </span>{" "}
              does not exist. You can return to the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction asChild>
            <a href="/" className="lovable-button-primary">
              Go to Dashboard
            </a>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotFound;
