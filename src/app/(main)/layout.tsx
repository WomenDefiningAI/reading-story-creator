import type React from "react";

// This layout applies specifically to pages within the (main) route group.
export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Apply container, padding, etc., specific to the main app view
	return <main className="container mx-auto px-4 py-8">{children}</main>;
}
