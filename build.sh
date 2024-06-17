readonly DIST=dist
readonly BASE=/countdown-timers
readonly TOTAL=$DIST$BASE

function clean() {
    if [ -d $DIST ]; then
        rm -r $DIST/*
    else
        mkdir dist
    fi
    mkdir $TOTAL
}

function copy_build() {
    # First argument is the path to the root of a project from the root of the repo
    # Second argument is the path to the directory with the build relative to the first argument
    # Third argument is the desired name of the directory
    cd $1

    bun run build
    if [ ! -z $3 ]; then
        mkdir ../$TOTAL/$3
    fi
    cp -r $2/* ../$TOTAL/$3

    cd -
}

function main() {
    clean
    copy_build root dist ""
    copy_build svelte build svelte
}

main
