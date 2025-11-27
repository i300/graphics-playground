import type { ExampleConfig } from "../examples";

/**
 * ExampleSelector UI Component
 *
 * Manages the sidebar navigation for switching between examples.
 * Creates buttons for each example and handles selection events.
 */
export class ExampleSelector {
  private container: HTMLElement;
  private examples: ExampleConfig[];
  private onSelectCallback: (exampleId: string) => void;
  private activeId: string | null = null;

  constructor(
    examples: ExampleConfig[],
    onSelect: (exampleId: string) => void
  ) {
    this.examples = examples;
    this.onSelectCallback = onSelect;

    // Get the navigation container from the DOM
    this.container = document.getElementById("examples-nav") as HTMLElement;
    if (!this.container) {
      throw new Error("Examples navigation container not found");
    }

    // Render all example buttons
    this.render();
  }

  /**
   * Render the example buttons
   */
  private render() {
    // Clear existing content
    this.container.innerHTML = "";

    // Create a button for each example
    this.examples.forEach((example) => {
      const button = this.createButton(example);
      this.container.appendChild(button);
    });
  }

  /**
   * Create a button for an example
   */
  private createButton(example: ExampleConfig): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "example-button";
    button.dataset.exampleId = example.id;

    // Create button content with name and description
    const nameDiv = document.createElement("div");
    nameDiv.className = "name";
    nameDiv.textContent = example.name;

    const descDiv = document.createElement("div");
    descDiv.className = "description";
    descDiv.textContent = example.description;

    button.appendChild(nameDiv);
    button.appendChild(descDiv);

    // Handle click event
    button.addEventListener("click", () => {
      this.onSelectCallback(example.id);
    });

    return button;
  }

  /**
   * Set the active example (highlights the button)
   */
  setActive(exampleId: string) {
    this.activeId = exampleId;

    // Remove active class from all buttons
    const buttons = this.container.querySelectorAll(".example-button");
    buttons.forEach((button) => {
      button.classList.remove("active");
    });

    // Add active class to selected button
    const activeButton = this.container.querySelector(
      `[data-example-id="${exampleId}"]`
    );
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }
}
