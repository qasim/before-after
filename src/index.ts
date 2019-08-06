(function() {
  // ************
  // General Info
  // ************
  //
  // Everything in this file lives in an Immediately Invoked Function
  // Expression. We do this to avoid polluting the global namespace.
  //
  // ==============
  // File Structure
  // ==============
  //
  // Each section contains a title and a paragraph defining its use.
  // All functions are defines at the bottom of the file, taking advantage
  // of function hoisting in JavaScript. Functions should go in their appropriate
  // section. If a section gets longer than 100 lines, feel free to move it to its
  // own file.
  //
  // We will follow a Space Shuttle style of programming. Every branch and
  // condition bust be considered and accounted for. Why? I just want an exercise
  // in doing it :)
  //
  // Each function should have its input and output types defined.

  // *****
  // TYPES
  // *****
  //
  // This section will contain all shared types.

  type Maybe<T> = T | null;

  type FormValue = {
    general: {
      fileName: Maybe<string>;
    };
  };

  // *******
  // GLOBALS
  // *******
  //
  // This section defines all HTML elements, magic numbers, and string constants.

  const TEXT = {
    initial: {fileName: 'before-v-after'},
  };

  const FORM: FormValue = {
    general: {
      fileName: null,
    },
  };

  const $ = {
    general: {
      fileName: document.getElementById(
        'general--file-name',
      ) as HTMLInputElement,
    },
  };

  // ****
  // MAIN
  // ****
  //
  // This section is _only_ for the main function.

  main();

  function main(): void {
    $.general.fileName.value = TEXT.initial.fileName;
    $.general.fileName.onchange = handleFileNameChange;
  }

  // ********
  // HANDLERS 
  // ********
  function handleFileNameChange(e: Event): void {
    const currentValue = (e.currentTarget as HTMLInputElement).value;
    FORM.general.fileName = currentValue;
  }
})();
