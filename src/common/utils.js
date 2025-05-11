

export async function GuardForeverRun(callback, delay = 100) {
    while (true) {
        try {
            await callback();
        } catch (error) {
            console.error("GuardForeverRun Fail , retry", error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
