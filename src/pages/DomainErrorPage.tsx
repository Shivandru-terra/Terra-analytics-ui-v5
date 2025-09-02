import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Mail } from "lucide-react";

const DomainErrorPage = () => {

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/30">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <img 
              src={"letsterra_logo.jpg"}
              alt="AI Analytics" 
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <Shield className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertDescription className="text-center text-sm">
              You are outside the Terra Company domain.
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              This application is restricted to Terra Company users only.
            </p>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.location.href = 'mailto:hello@letsterra.com?subject=Access Request for AI Analytics'}
            >
              <Mail className="h-4 w-4" />
              Email for Access
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Contact <span className="font-medium">hello@letsterra.com</span> to request access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainErrorPage;