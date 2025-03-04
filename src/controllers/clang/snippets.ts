const header = `
/**
 * This file was generated by EverDev.
 * EverDev is a part of EVER OS (see http://ton.dev).
 */
`;
export const BasicContractCode =
    header +
    `
#include "{name}"
#include <tvm/contract.hpp>
#include <tvm/smart_switcher.hpp>
#include <tvm/contract_handle.hpp>
#include <tvm/replay_attack_protection/timestamp.hpp>
#include <tvm/default_support_functions.hpp>

using namespace tvm;
using namespace schema;

static constexpr unsigned TIMESTAMP_DELAY = 1800;

class Proxy final : public smart_interface<IProxy>, public DProxy {
  using replay_protection_t = replay_attack_protection::timestamp<TIMESTAMP_DELAY>;
public:
  struct error_code : tvm::error_code {
    static constexpr unsigned message_sender_is_not_my_owner = 100;
  };

  __always_inline
  void constructor(uint256 pubkey) {
    owner_ = pubkey;
  }

  __always_inline
  void sendMessage(cell msg, uint8 flags) {
    require(tvm_pubkey() == owner_, error_code::message_sender_is_not_my_owner);
    tvm_accept();
    tvm_sendmsg(msg, flags.get());
  }
  // =============== Support functions ==================
  DEFAULT_SUPPORT_FUNCTIONS(IProxy, replay_protection_t)

  // default processing of unknown messages
  __always_inline static int _fallback(cell msg, slice msg_body) {
    return 0;
  }
};

DEFINE_JSON_ABI(IProxy, DProxy, EProxy);

// ----------------------------- Main entry functions ---------------------- //
DEFAULT_MAIN_ENTRY_FUNCTIONS(Proxy, IProxy, DProxy, TIMESTAMP_DELAY)
`;
export const BasicContractHeaders =
    header +
    `
#pragma once

#include <tvm/schema/message.hpp>
#include <tvm/smart_switcher.hpp>
#include <tvm/contract_handle.hpp>

namespace tvm { namespace schema {

__interface IProxy {

  [[external, dyn_chain_parse]]
  void constructor(uint256 pubkey) = 1;

  [[external, noaccept, dyn_chain_parse]]
  void sendMessage(cell msg, uint8 flags) = 2;
};
using IProxyPtr = handle<IProxy>;

struct DProxy {
  uint256 owner_;
};

__interface EProxy {
};

}} // namespace tvm::schema
`;
