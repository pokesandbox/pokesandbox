import React from "react";
import { render } from "@testing-library/react";

import NotFoundPage from "../src/app/(shared)/not-found/page";

describe("NotFoundPage", () => {
  it("should render successfully", () => {
    const { getByText } = render(<NotFoundPage />);
    expect(getByText("Page Not Found")).toBeTruthy();
  });
});
