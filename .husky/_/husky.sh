#!/bin/sh

if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "true" ] && echo "husky (debug) - $*"
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."
  if [ "$HUSKY" = "skip" ]; then
    debug "HUSKY env variable is set to skip, skipping hook" && exit 0
  fi
  export readonly husky_skip_init=1
  sh -e "$0" "$@"
  exit $?
fi
