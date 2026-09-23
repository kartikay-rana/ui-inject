import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs.js';

export interface ExampleProps {}

const PANEL: React.CSSProperties = { padding: '18px 16px', fontSize: 14, color: 'var(--foreground)' };

/** Free · Navigation · Underline tabs (Companies / Deals / Forecast). */
export default function Example({}: ExampleProps) {
  return (
    <Tabs defaultValue="companies">
      <TabsList aria-label="pipeline views">
        <TabsTrigger value="companies">Companies</TabsTrigger>
        <TabsTrigger value="deals">Deals</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
      </TabsList>
      <TabsContent value="companies" style={PANEL}>
        Companies view
      </TabsContent>
      <TabsContent value="deals" style={PANEL}>
        Deals board view
      </TabsContent>
      <TabsContent value="forecast" style={PANEL}>
        Forecast view
      </TabsContent>
    </Tabs>
  );
}