import debug from "debug"

const log: debug.IDebugger = debug("seeds")

async function runSeeds() {
  try {
    console.log("running seeds")
    log(await Promise.all([]))
    process.exit(0)
  } catch (e: any) {
    log(`An error occurred ${e}`)
    console.log(e)
    throw new Error(e)
  }
}

runSeeds()
