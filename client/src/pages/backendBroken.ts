// note: is currently built so it doesn't use Alpine.js after all
// if this changes, we need to call Alpine.start() in the checkOk().finally() block :)
export default () => `
    <div class="flex flex-col gap-4 h-full justify-center synthglow">
        <ban-icon size="100" color="darkmagenta" class="spinning"></ban-icon>
        <div class="font-bold text-2xl">
            Backend broken. Fuck the shit off.
        </div>
        <div>
            Or maybe try (re)starting it and try again, good ma'am.
        </div>
        <div class="text-xs">
             Sorry for being rude.
        </div>
    </div>
`;
