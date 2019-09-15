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
  // a section gets longer than 100 lines, feel free to move it to its
  // own file.
  //
  // Each function should have its input and output types defined.

  // *****
  // TYPES
  // *****
  //
  // This section will contain all shared types.

  type FormValue = {
    general: {
      fileName: string;
    };
    before: {
      file: File | null;
      text: string | null;
    };
    after: {
      file: File | null;
      text: string | null;
    };
  };

  enum Side {
    before = 'before',
    after = 'after',
  }

  // *******
  // GLOBALS
  // *******
  //
  // This section defines all HTML elements, magic numbers, and string constants.

  const TEXT = {
    initial: {
      fileName: 'before-v-after',
      before: 'before',
      after: 'after',
    },
  };

  const FORM: FormValue = {
    general: {
      fileName: TEXT.initial.fileName,
    },
    before: {
      file: null,
      text: TEXT.initial.before,
    },
    after: {
      file: null,
      text: TEXT.initial.after,
    },
  };

  const $ = {
    general: {
      fileName: document.getElementById(
        'general--file-name',
      ) as HTMLInputElement,
    },
    before: {
      file: document.getElementById('before--file') as HTMLInputElement,
      text: document.getElementById('before--text') as HTMLInputElement,
    },
    after: {
      file: document.getElementById('after--file') as HTMLInputElement,
      text: document.getElementById('after--text') as HTMLInputElement,
    },
    content: {
      canvasWrapper: document.getElementById('scale') as HTMLDivElement,
      canvas: document.getElementById('canvas') as HTMLCanvasElement,
    },
    submit: document.getElementById('submit') as HTMLButtonElement,
    output: document.getElementById('output-img') as HTMLLinkElement,
  };

  // ****
  // MAIN
  // ****
  //
  // This section is _only_ for the main function.

  main();

  function main(): void {
    // This is experimental browser technology. We should find a solution that
    // will work in Safari.
    const resizeObserver = new window.ResizeObserver(entries => {
      const [canvasWrapper] = entries;
      setTimeout(() => {
        setup(canvasWrapper.contentRect);
        draw(Side.before);
        draw(Side.after);
      });
    });
    resizeObserver.observe($.content.canvasWrapper);
    $.general.fileName.value = FORM.general.fileName;
    $.general.fileName.onchange = validateForm(handleFileNameChange);

    $.before.file.onchange = validateForm(handleAddFile(Side.before));
    $.before.file.value = '';
    $.before.text.oninput = handleTextNameChange(Side.before);
    $.before.text.value = FORM.before.text || '';

    $.after.file.onchange = validateForm(handleAddFile(Side.after));
    $.after.file.value = '';
    $.after.text.oninput = handleTextNameChange(Side.after);
    $.after.text.value = FORM.after.text || '';

    $.submit.onclick = handleSubmit;
    $.submit.disabled = true;

    setup($.content.canvasWrapper.getBoundingClientRect());
    draw(Side.before);
    draw(Side.after);
  }

  // ********
  // HANDLERS
  // ********
  //
  // This section contains code that handles HTML events, like `onclick` and
  // `onchange`,

  function handleFileNameChange(e: Event): void {
    const currentValue = (e.currentTarget as HTMLInputElement).value;
    FORM.general.fileName = currentValue;
  }

  function handleTextNameChange(side: Side): (e: Event) => void {
    return (e: Event) => {
      const currentValue = (e.target as HTMLInputElement).value;
      setTimeout(() => {
        FORM[side].text = currentValue;
        draw(side);
      }, 300);
    };
  }

  function handleSubmit(): void {
    const {canvas} = $.content;
    const link = $.output;
    link.setAttribute('download', `${FORM.general.fileName}.png`);
    const image = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    link.setAttribute('href', image);
    link.click();
  }

  function handleAddFile(side: Side): () => void {
    return () => {
      const files = $[side].file.files;
      if (!files) {
        return;
      } else {
        switch (files.length) {
          case 0:
            throw new Error('0 files added');
          case 1:
            const file = files.item(0);
            FORM[side].file = file;
            draw(side);
            return;
          default:
            throw new Error('More than one file added');
        }
      }
    };
  }

  // *****
  // UTILS
  // *****
  //
  // This section contains general utilities.

  function setup(rect: ClientRect) {
    $.content.canvas.width = rect.width * window.devicePixelRatio;
    $.content.canvas.height = rect.height * window.devicePixelRatio;

    const ctx = $.content.canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function draw(side: Side) {
    clearCanvasSide(side);
    try {
      drawFile(side).then(() => drawText(side));
    } catch {
      drawText(side);
    }
  }

  function drawFile(side: Side): Promise<void> {
    const ctx = $.content.canvas.getContext('2d');
    if (!ctx) throw new Error('cannot draw without a context');

    const {file} = FORM[side];
    if (file === null) throw new Error('cannot draw without a file');

    const width = ctx.canvas.width / window.devicePixelRatio;
    const halfCanvas = width / 2;

    return getImage(side).then(image =>
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        side === Side.before ? 0 : halfCanvas,
        0,
        // todo: scale image properly
        halfCanvas,
        getImageResizeHeight(image, halfCanvas),
      ),
    );
  }

  function drawText(side: Side) {
    const ctx = $.content.canvas.getContext('2d');
    if (!ctx) return;
    const width = ctx.canvas.width / window.devicePixelRatio;
    const {text} = FORM[side];
    if (!text) return;

    ctx.font = '20px Sans-serif';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText(text, 10 + (side === Side.before ? 0 : width / 2), 30);
    ctx.fillText(text, 10 + (side === Side.before ? 0 : width / 2), 30);
  }

  function clearCanvasSide(side: Side): void {
    const ctx = $.content.canvas.getContext('2d');
    if (!ctx) return;
    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const {width, height} = ctx.canvas;
    const topLeft = {
      x: side === Side.before ? 0 : width / 2,
      y: 0,
    };
    ctx.clearRect(topLeft.x, topLeft.y, width / 2, height);

    // Restore the transform
    ctx.restore();
  }

  function fileToImageSrc(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise(resolve => {
      reader.onloadend = () => {
        const {result} = reader;
        if (!result) throw new Error('could not convert file to image src');
        resolve(result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  function getImage(side: Side): Promise<HTMLImageElement> {
    const {file} = FORM[side];
    if (!file) throw new Error('file is not defined!');
    return new Promise(resolve =>
      fileToImageSrc(file).then(imageSrc => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = imageSrc;
      }),
    );
  }

  function getImageResizeHeight(
    image: HTMLImageElement,
    newWidth: number,
  ): number {
    const {width, height} = image;
    const aspectRatio = width / height;
    return newWidth / aspectRatio;
  }

  function validateForm(handler: Function) {
    return (...args: any[]) => {
      handler(...args);
      if (FORM.general.fileName && FORM.before.file && FORM.after.file)
        $.submit.disabled = false;
      else $.submit.disabled = true;
    };
  }
})();
