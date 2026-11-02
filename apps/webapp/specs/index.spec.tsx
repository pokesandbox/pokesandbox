import React from "react";
import { render } from "@testing-library/react";

import NotFoundPage from "../src/app/(shared)/not-found/page";

// Smoke test for the webapp jest setup. The generator's original spec imported
// `src/app/page`, which no longer exists since routes moved into route groups.
describe("NotFoundPage", () => {
  it("should render successfully", () => {
    const { getByText } = render(<NotFoundPage />);
    expect(getByText("Page Not Found")).toBeTruthy();
  });
});
